"""
Medical Agent Service
Orchestrates LLM-based agent with tool calling for medical report retrieval and RAG queries
"""
import logging
import json
from typing import Dict, Any, List, Optional
from django.conf import settings
from openai import OpenAI
from .report_tools import ReportTools

logger = logging.getLogger(__name__)


class MedicalAgent:
    """
    LLM-based medical agent with function calling capabilities
    Combines report retrieval with RAG-based medical knowledge
    """

    def __init__(self, status_callback=None):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.tools_instance = ReportTools()
        self.tool_definitions = self._create_tool_definitions()
        self.max_iterations = getattr(settings, 'AGENT_MAX_ITERATIONS', 5)
        self.model = getattr(settings, 'AGENT_MODEL', 'gpt-4-turbo-preview')
        self.temperature = getattr(settings, 'AGENT_TEMPERATURE', 0.3)
        self.status_callback = status_callback  # Callback to send status updates

    def _create_tool_definitions(self) -> List[Dict]:
        """
        Define tools for OpenAI function calling
        These match the methods in ReportTools
        """
        return [
            {
                "type": "function",
                "function": {
                    "name": "search_patient_reports",
                    "description": "Search for a patient's medical reports. Use this when the user asks to see, view, or find their medical reports. Supports fuzzy matching for report types.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "report_type": {
                                "type": "string",
                                "description": "Optional report type to filter by (e.g., 'pathology', 'biopsy', 'lab'). Supports partial matching."
                            },
                            "date_from": {
                                "type": "string",
                                "description": "Optional start date filter in YYYY-MM-DD format"
                            },
                            "date_to": {
                                "type": "string",
                                "description": "Optional end date filter in YYYY-MM-DD format"
                            },
                            "limit": {
                                "type": "integer",
                                "description": "Maximum number of results (default 50)"
                            }
                        },
                        "required": []
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_report_content",
                    "description": "Retrieve the full content of a specific medical report. Use this after finding a report ID. Includes automatic access control verification.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "report_id": {
                                "type": "string",
                                "description": "The medical record ID to retrieve"
                            }
                        },
                        "required": ["report_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "list_available_report_types",
                    "description": "Get a list of all available medical record types in the system. Use this when the user asks what types of reports are available.",
                    "parameters": {
                        "type": "object",
                        "properties": {}
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "disambiguate_report_type",
                    "description": "Find matching report types when an exact match is not found. Use this when a search returns no results to suggest alternatives.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_query": {
                                "type": "string",
                                "description": "The user's report type query"
                            }
                        },
                        "required": ["user_query"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "search_knowledge_base",
                    "description": "Search medical knowledge base for accurate information about conditions, treatments, and procedures using RAG. Use this for general medical questions or to explain medical terms from reports.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "query": {
                                "type": "string",
                                "description": "The medical question or query"
                            },
                            "cancer_type_id": {
                                "type": "integer",
                                "description": "Optional cancer type ID to filter relevant documents"
                            },
                            "language": {
                                "type": "string",
                                "description": "Response language (default: English)"
                            }
                        },
                        "required": ["query"]
                    }
                }
            }
        ]

    def _send_status(self, message: str):
        """Send status update to callback if available"""
        if self.status_callback:
            self.status_callback(message)

    def _execute_tool(
        self,
        tool_name: str,
        arguments: Dict[str, Any],
        auth_token: str = "",
        session_id: Optional[str] = None,
        chat_history: Optional[List] = None
    ) -> Dict[str, Any]:
        """
        Execute a tool call and return the result

        Args:
            tool_name: Name of the tool to execute
            arguments: Tool arguments
            auth_token: JWT auth token (needed for RAG)
            session_id: Chat session ID
            chat_history: Chat history

        Returns:
            Tool execution result as dict
        """
        try:
            logger.info(f"Executing tool: {tool_name} with args: {arguments}")

            if tool_name == "search_patient_reports":
                self._send_status("Searching medical reports...")
                result = self.tools_instance.search_patient_reports(**arguments)
                # If reports found, format them nicely
                if result.get('success') and result.get('count', 0) > 0:
                    formatted = self.tools_instance.format_report_list(result['reports'])
                    result['formatted_list'] = formatted
                return result

            elif tool_name == "get_report_content":
                self._send_status("Retrieving report content...")
                return self.tools_instance.get_report_content(**arguments)

            elif tool_name == "list_available_report_types":
                self._send_status("Loading available report types...")
                return self.tools_instance.list_available_report_types()

            elif tool_name == "disambiguate_report_type":
                self._send_status("Finding matching report types...")
                return self.tools_instance.disambiguate_report_type(**arguments)

            elif tool_name == "search_knowledge_base":
                self._send_status("Searching medical knowledge base...")
                # Add auth context for RAG
                arguments['auth_token'] = auth_token
                arguments['session_id'] = session_id
                arguments['chat_history'] = chat_history
                result = self.tools_instance.search_knowledge_base(**arguments)
                self._send_status("Analyzing medical information...")
                return result

            else:
                return {
                    'success': False,
                    'error': f"Unknown tool: {tool_name}"
                }

        except Exception as e:
            logger.error(f"Error executing tool {tool_name}: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    def chat(
        self,
        user_message: str,
        patient_id: int,
        user_id: int,
        cancer_type_id: Optional[int],
        chat_history: List[Dict],
        language: str = "English",
        auth_token: str = "",
        session_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Main agent chat loop with tool calling

        Args:
            user_message: The user's message
            patient_id: Patient ID
            user_id: User ID (for access control)
            cancer_type_id: Cancer type context
            chat_history: Previous conversation history
            language: Response language
            auth_token: JWT auth token
            session_id: Chat session ID

        Returns:
            Dict with response, success status, and metadata
        """
        try:
            # Build system message
            system_message = {
                "role": "system",
                "content": (
                    f"You are a helpful medical assistant following NCCN guidelines. "
                    f"You have access to tools to retrieve patient medical reports and search medical knowledge. "
                    f"Always respond in {language}. "
                    f"\n\nIMPORTANT: For ANY medical question (e.g., about risk factors, symptoms, treatments, procedures, conditions), "
                    f"you MUST use the 'search_knowledge_base' tool to retrieve accurate, up-to-date information from our medical knowledge base. "
                    f"DO NOT answer medical questions from your training data alone. "
                    f"Always search the knowledge base first, then provide the information from the retrieved documents. "
                    f"\n\nWhen showing reports, provide clear summaries. "
                    f"Always cite sources when providing medical information. "
                    f"Be empathetic and clear in your communication."
                )
            }

            # Build messages array
            messages = [system_message] + chat_history + [
                {"role": "user", "content": user_message}
            ]

            iteration = 0
            tool_calls_made = []

            while iteration < self.max_iterations:
                logger.info(f"Agent iteration {iteration + 1}/{self.max_iterations}")

                if iteration == 0:
                    self._send_status("Analyzing your question...")
                else:
                    self._send_status("Preparing response...")

                # Call OpenAI with tools
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    tools=self.tool_definitions,
                    tool_choice="auto",
                    temperature=self.temperature
                )

                assistant_message = response.choices[0].message

                # Check if we have a final answer
                if not assistant_message.tool_calls:
                    return {
                        'success': True,
                        'response': assistant_message.content,
                        'tool_calls_made': tool_calls_made,
                        'iterations': iteration + 1
                    }

                # Add assistant message to history
                messages.append({
                    "role": "assistant",
                    "content": assistant_message.content,
                    "tool_calls": [
                        {
                            "id": tc.id,
                            "type": "function",
                            "function": {
                                "name": tc.function.name,
                                "arguments": tc.function.arguments
                            }
                        } for tc in assistant_message.tool_calls
                    ]
                })

                # Execute each tool call
                for tool_call in assistant_message.tool_calls:
                    function_name = tool_call.function.name
                    try:
                        function_args = json.loads(tool_call.function.arguments)
                    except json.JSONDecodeError as e:
                        logger.error(f"Failed to parse tool arguments: {e}")
                        function_args = {}

                    # ALWAYS override patient_id to ensure correct patient context
                    if function_name in ["search_patient_reports", "get_report_content"]:
                        function_args['patient_id'] = patient_id

                    # ALWAYS override user_id for get_report_content
                    if function_name == "get_report_content":
                        function_args['user_id'] = user_id

                    # Add cancer_type_id for search_knowledge_base if available
                    if function_name == "search_knowledge_base":
                        if 'cancer_type_id' not in function_args and cancer_type_id:
                            function_args['cancer_type_id'] = cancer_type_id

                    # Execute tool
                    tool_result = self._execute_tool(
                        tool_name=function_name,
                        arguments=function_args,
                        auth_token=auth_token,
                        session_id=session_id,
                        chat_history=chat_history
                    )

                    # Log tool call
                    tool_calls_made.append({
                        'tool': function_name,
                        'arguments': function_args,
                        'success': tool_result.get('success', False)
                    })

                    # Add tool result to messages
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "name": function_name,
                        "content": json.dumps(tool_result)
                    })

                iteration += 1

            # Max iterations reached
            logger.warning(f"Agent reached max iterations ({self.max_iterations})")
            return {
                'success': False,
                'response': "I apologize, but I need more information to complete your request. Could you please rephrase or provide more details?",
                'error': 'Max iterations reached',
                'tool_calls_made': tool_calls_made,
                'iterations': iteration
            }

        except Exception as e:
            logger.error(f"Agent error: {e}")
            return {
                'success': False,
                'response': "I apologize, but I encountered an error processing your request. Please try again.",
                'error': str(e),
                'tool_calls_made': tool_calls_made if 'tool_calls_made' in locals() else []
            }
