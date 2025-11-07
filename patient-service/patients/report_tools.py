"""
Report Tools for Medical Agent
Provides tools for report retrieval, search, and disambiguation
"""
import logging
from typing import Dict, Any, Optional, List
from .services import DatabaseService
from .rag_service import RAGService

logger = logging.getLogger(__name__)


class ReportTools:
    """Tools for medical report operations used by the agent"""

    def __init__(self):
        self.db = DatabaseService
        self.rag = RAGService()

    def list_available_report_types(self) -> Dict[str, Any]:
        """
        Get all available medical record types

        Returns:
            Dict with success status and list of report types
        """
        try:
            types = self.db.get_medical_record_types()
            return {
                'success': True,
                'count': len(types),
                'report_types': types
            }
        except Exception as e:
            logger.error(f"Error listing report types: {e}")
            return {
                'success': False,
                'error': str(e),
                'report_types': []
            }

    def search_patient_reports(
        self,
        patient_id: int,
        report_type: Optional[str] = None,
        date_from: Optional[str] = None,
        date_to: Optional[str] = None,
        limit: int = 50
    ) -> Dict[str, Any]:
        """
        Search for patient's medical reports

        Args:
            patient_id: Patient ID to search for
            report_type: Optional report type (supports fuzzy matching)
            date_from: Optional start date (YYYY-MM-DD)
            date_to: Optional end date (YYYY-MM-DD)
            limit: Maximum results (default 50)

        Returns:
            Dict with search results and metadata
        """
        try:
            result = self.db.search_medical_reports(
                patient_id=patient_id,
                report_type=report_type,
                date_from=date_from,
                date_to=date_to,
                limit=limit
            )

            if 'error' in result:
                return {
                    'success': False,
                    'error': result['error'],
                    'count': 0,
                    'reports': []
                }

            return {
                'success': True,
                'count': result.get('count', 0),
                'reports': result.get('results', []),
                'message': result.get('message', '')
            }

        except Exception as e:
            logger.error(f"Error searching reports: {e}")
            return {
                'success': False,
                'error': str(e),
                'count': 0,
                'reports': []
            }

    def get_report_content(
        self,
        patient_id: int,
        user_id: int,
        report_id: str
    ) -> Dict[str, Any]:
        """
        Get full report content with access control check

        Args:
            patient_id: Patient ID (for logging)
            user_id: User ID requesting access
            report_id: Medical record ID

        Returns:
            Dict with report content if access granted
        """
        try:
            # Get report with access check
            report = self.db.get_medical_report_with_access(
                report_id=report_id,
                user_id=user_id
            )

            if not report:
                return {
                    'success': False,
                    'error': 'Access denied or report not found',
                    'message': 'You do not have permission to view this report, or it does not exist.'
                }

            # Check for error in response
            if 'error' in report:
                return {
                    'success': False,
                    'error': report['error'],
                    'message': report.get('message', 'Unable to retrieve report')
                }

            # Extract relevant information
            return {
                'success': True,
                'report': {
                    'id': report.get('file'),
                    'filename': report.get('file_info', {}).get('filename', 'Unknown'),
                    'type': report.get('medical_record_type_name', 'Unknown'),
                    'created_at': report.get('created_at', ''),
                    'file_info': report.get('file_info', {}),
                    'patient_id': report.get('patient', patient_id)
                },
                'message': 'Report retrieved successfully'
            }

        except Exception as e:
            logger.error(f"Error retrieving report content: {e}")
            return {
                'success': False,
                'error': str(e),
                'message': 'An error occurred while retrieving the report'
            }

    def disambiguate_report_type(self, user_query: str) -> Dict[str, Any]:
        """
        Find matching report types when exact match not found

        Args:
            user_query: User's report type query (e.g., "pathology", "scan")

        Returns:
            Dict with matching types and suggestions
        """
        try:
            result = self.db.match_report_type(user_query)

            if 'error' in result:
                return {
                    'success': False,
                    'error': result['error'],
                    'matches': []
                }

            exact_match = result.get('exact_match', False)
            matches = result.get('matches', [])
            suggestions = result.get('suggestions', [])

            if exact_match:
                return {
                    'success': True,
                    'exact_match': True,
                    'matched_type': matches[0] if matches else None,
                    'message': f"Found exact match for '{user_query}'"
                }
            elif matches:
                return {
                    'success': True,
                    'exact_match': False,
                    'possible_matches': matches,
                    'message': result.get('message', f"Found {len(matches)} possible matches")
                }
            else:
                return {
                    'success': True,
                    'exact_match': False,
                    'possible_matches': [],
                    'suggestions': suggestions,
                    'message': result.get('message', f"No matches found for '{user_query}'")
                }

        except Exception as e:
            logger.error(f"Error disambiguating report type: {e}")
            return {
                'success': False,
                'error': str(e),
                'matches': []
            }

    def search_knowledge_base(
        self,
        query: str,
        cancer_type_id: Optional[int] = None,
        auth_token: str = "",
        session_id: Optional[str] = None,
        chat_history: Optional[List] = None,
        language: str = "English"
    ) -> Dict[str, Any]:
        """
        Query existing RAG system for medical knowledge

        Args:
            query: The user's medical question
            cancer_type_id: Optional cancer type filter
            auth_token: JWT authentication token
            session_id: Optional session ID
            chat_history: Optional chat history for context
            language: Response language (default: English)

        Returns:
            Dict with RAG response
        """
        try:
            result = self.rag.query_with_context(
                query=query,
                cancer_type_id=cancer_type_id,
                auth_token=auth_token,
                session_id=session_id,
                chat_history=chat_history or [],
                language=language
            )

            if result.get('success'):
                return {
                    'success': True,
                    'answer': result.get('answer') or result.get('response', ''),
                    'sources': result.get('sources', []),
                    'message': 'Knowledge base query successful'
                }
            else:
                return {
                    'success': False,
                    'error': result.get('error', 'RAG query failed'),
                    'answer': result.get('response', 'Unable to answer question')
                }

        except Exception as e:
            logger.error(f"Error querying knowledge base: {e}")
            return {
                'success': False,
                'error': str(e),
                'answer': 'An error occurred while searching the knowledge base'
            }

    def format_report_list(self, reports: List[Dict[str, Any]]) -> str:
        """
        Format a list of reports for display to user

        Args:
            reports: List of report dictionaries

        Returns:
            Formatted string representation of reports
        """
        if not reports:
            return "No reports found."

        formatted_lines = []
        for idx, report in enumerate(reports, 1):
            type_name = report.get('medical_record_type_name', 'Unknown Type')
            created_at = report.get('created_at', 'Unknown Date')
            # Extract just the date part if datetime string
            if 'T' in created_at:
                created_at = created_at.split('T')[0]

            filename = report.get('file_info', {}).get('filename', 'Unknown File')
            formatted_lines.append(f"{idx}. {type_name} - {created_at} ({filename})")

        return "\n".join(formatted_lines)

    def extract_report_summary(self, report_data: Dict[str, Any]) -> str:
        """
        Extract a summary of key information from a report

        Args:
            report_data: Report data dictionary

        Returns:
            Summary string
        """
        if not report_data.get('success'):
            return "Unable to summarize report - access denied or report not found."

        report = report_data.get('report', {})
        summary_parts = [
            f"Report Type: {report.get('type', 'Unknown')}",
            f"Date: {report.get('created_at', 'Unknown')}",
            f"Filename: {report.get('filename', 'Unknown')}"
        ]

        return "\n".join(summary_parts)
