import requests
from django.conf import settings
from typing import Dict, Any, Optional, List
import logging
import json

logger = logging.getLogger(__name__)


class DatabaseService:
    """Service class for communicating with database-service"""
    
    @staticmethod
    def make_request(method: str, endpoint: str, data: Optional[Dict] = None, 
                    params: Optional[Dict] = None, headers: Optional[Dict] = None) -> Dict[str, Any]:
        """Make HTTP request to database service"""
        url = f"{settings.DATABASE_SERVICE_URL}{endpoint}"
        
        if headers is None:
            headers = {}
        
        # Add service authentication token
        headers['X-Service-Token'] = getattr(settings, 'DATABASE_SERVICE_TOKEN', 'db-service-secret-token')
        headers['Content-Type'] = 'application/json'
        
        try:
            response = requests.request(
                method=method,
                url=url,
                json=data,
                params=params,
                headers=headers,
                timeout=30
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Database service request failed: {e}")
            raise Exception(f"Database service error: {str(e)}")
    
    # Language operations
    @staticmethod
    def get_languages() -> List[Dict[str, Any]]:
        """Get all active languages"""
        try:
            return DatabaseService.make_request('GET', '/api/languages/')
        except Exception as e:
            logger.error(f"Failed to get languages: {e}")
            return []
    
    @staticmethod
    def get_language(code: str) -> Optional[Dict[str, Any]]:
        """Get language by code"""
        try:
            return DatabaseService.make_request('GET', f'/api/languages/{code}/')
        except Exception as e:
            logger.error(f"Failed to get language: {e}")
            return None
    
    # Patient operations
    @staticmethod
    def get_patient_by_user_id(user_id: int) -> Optional[Dict[str, Any]]:
        """Get patient by user ID"""
        try:
            return DatabaseService.make_request('GET', '/api/patients/by_user/', params={'user_id': user_id})
        except Exception as e:
            logger.error(f"Failed to get patient by user ID: {e}")
            return None
    
    @staticmethod
    def get_patient(patient_id: int) -> Optional[Dict[str, Any]]:
        """Get patient by ID"""
        try:
            return DatabaseService.make_request('GET', f'/api/patients/{patient_id}/')
        except Exception as e:
            logger.error(f"Failed to get patient: {e}")
            return None
    
    @staticmethod
    def create_patient(patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new patient"""
        return DatabaseService.make_request('POST', '/api/patients/', data=patient_data)
    
    @staticmethod
    def update_patient(patient_id: int, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update patient information"""
        return DatabaseService.make_request('PATCH', f'/api/patients/{patient_id}/', data=patient_data)
    
    # Appointment operations
    @staticmethod
    def get_appointments(params: Optional[Dict] = None) -> List[Dict[str, Any]]:
        """Get appointments with optional filters"""
        try:
            return DatabaseService.make_request('GET', '/api/appointments/', params=params)
        except Exception as e:
            logger.error(f"Failed to get appointments: {e}")
            return []
    
    @staticmethod
    def get_appointment(appointment_id: int) -> Optional[Dict[str, Any]]:
        """Get appointment by ID"""
        try:
            return DatabaseService.make_request('GET', f'/api/appointments/{appointment_id}/')
        except Exception as e:
            logger.error(f"Failed to get appointment: {e}")
            return None
    
    @staticmethod
    def create_appointment(appointment_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new appointment"""
        return DatabaseService.make_request('POST', '/api/appointments/', data=appointment_data)
    
    @staticmethod
    def update_appointment(appointment_id: int, appointment_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update appointment"""
        return DatabaseService.make_request('PATCH', f'/api/appointments/{appointment_id}/', data=appointment_data)
    
    @staticmethod
    def get_upcoming_appointments(patient_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get upcoming appointments"""
        params = {}
        if patient_id:
            params['patient_id'] = patient_id
        try:
            return DatabaseService.make_request('GET', '/api/appointments/upcoming/', params=params)
        except Exception as e:
            logger.error(f"Failed to get upcoming appointments: {e}")
            return []
    
    # Medical Record operations
    @staticmethod
    def get_medical_records(params: Optional[Dict] = None) -> List[Dict[str, Any]]:
        """Get medical records with optional filters"""
        try:
            response = DatabaseService.make_request('GET', '/api/medical-records/', params=params)
            # Handle paginated response from database service
            if isinstance(response, dict) and 'results' in response:
                return response['results']
            elif isinstance(response, list):
                return response
            else:
                logger.warning(f"Unexpected response format from medical records: {type(response)}")
                return []
        except Exception as e:
            logger.error(f"Failed to get medical records: {e}")
            return []
    
    @staticmethod
    def get_medical_record_types() -> List[Dict[str, Any]]:
        """Get all active medical record types"""
        try:
            return DatabaseService.make_request('GET', '/api/medical-record-types/')
        except Exception as e:
            logger.error(f"Failed to get medical record types: {e}")
            return []
    
    @staticmethod
    def get_medical_record(record_id: int) -> Optional[Dict[str, Any]]:
        """Get medical record by ID"""
        try:
            return DatabaseService.make_request('GET', f'/api/medical-records/{record_id}/')
        except Exception as e:
            logger.error(f"Failed to get medical record: {e}")
            return None
    
    @staticmethod
    def create_medical_record(record_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new medical record"""
        return DatabaseService.make_request('POST', '/api/medical-records/', data=record_data)
    
    # Prescription operations
    @staticmethod
    def get_prescriptions(params: Optional[Dict] = None) -> List[Dict[str, Any]]:
        """Get prescriptions with optional filters"""
        try:
            return DatabaseService.make_request('GET', '/api/prescriptions/', params=params)
        except Exception as e:
            logger.error(f"Failed to get prescriptions: {e}")
            return []
    
    @staticmethod
    def get_prescription(prescription_id: int) -> Optional[Dict[str, Any]]:
        """Get prescription by ID"""
        try:
            return DatabaseService.make_request('GET', f'/api/prescriptions/{prescription_id}/')
        except Exception as e:
            logger.error(f"Failed to get prescription: {e}")
            return None
    
    @staticmethod
    def get_active_prescriptions(patient_id: int) -> List[Dict[str, Any]]:
        """Get active prescriptions for a patient"""
        try:
            return DatabaseService.make_request('GET', '/api/prescriptions/active_by_patient/', 
                                              params={'patient_id': patient_id})
        except Exception as e:
            logger.error(f"Failed to get active prescriptions: {e}")
            return []
    
    # Clinician operations
    @staticmethod
    def get_available_clinicians() -> List[Dict[str, Any]]:
        """Get available clinicians"""
        try:
            return DatabaseService.make_request('GET', '/api/clinicians/available/')
        except Exception as e:
            logger.error(f"Failed to get available clinicians: {e}")
            return []
    
    @staticmethod
    def get_clinician(clinician_id: int) -> Optional[Dict[str, Any]]:
        """Get clinician by ID"""
        try:
            return DatabaseService.make_request('GET', f'/api/clinicians/{clinician_id}/')
        except Exception as e:
            logger.error(f"Failed to get clinician: {e}")
            return None
    
    @staticmethod
    def search_clinicians_by_specialization(specialization: str) -> List[Dict[str, Any]]:
        """Search clinicians by specialization"""
        try:
            return DatabaseService.make_request('GET', '/api/clinicians/by_specialization/', 
                                              params={'specialization': specialization})
        except Exception as e:
            logger.error(f"Failed to search clinicians: {e}")
            return []
    
    # User operations
    @staticmethod
    def get_user(user_id: int) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        try:
            return DatabaseService.make_request('GET', f'/api/users/{user_id}/')
        except Exception as e:
            logger.error(f"Failed to get user: {e}")
            return None
    
    # Event logging
    @staticmethod
    def log_event(event_type: str, service: str, data: Dict[str, Any]) -> None:
        """Log an event to database service"""
        try:
            DatabaseService.make_request('POST', '/api/events/', data={
                'event_type': event_type,
                'service': service,
                'data': data
            })
        except Exception as e:
            logger.error(f"Failed to log event: {e}")


    @staticmethod
    def create_chat_session(patient_id: int) -> Optional[Dict[str, Any]]:
        try:
            return DatabaseService.make_request("POST", "/api/chat/start/", data={"patient_id": patient_id})
        except Exception as e:
            logger.error(f"Failed to create chat session for patient {patient_id}: {e}")
            return None

    @staticmethod
    def get_chat_sessions_by_patient(patient_id: int) -> List[Dict[str, Any]]:
        try:
            return DatabaseService.make_request("GET", f"/api/chat/sessions/?patient_id={patient_id}")
        except Exception as e:
            logger.error(f"Failed to get sessions for patient {patient_id}: {e}")
            return []

    @staticmethod
    def get_session_and_messages(session_id: str, patient_id: int) -> tuple[Optional[Dict[str, Any]], List[Dict[str, Any]]]:
        try:
            session = DatabaseService.make_request("GET", f"/api/chat/load/?session_id={session_id}&patient_id={patient_id}")
            messages = DatabaseService.make_request("GET", f"/api/chat/messages/?session_id={session_id}")
            return session, messages
        except Exception as e:
            logger.error(f"Failed to load session and messages for session {session_id}: {e}")
            return None, []

    @staticmethod
    def get_latest_chat_session(patient_id: int) -> Optional[Dict[str, Any]]:
        # Optional: need to expose this on the DB side if it's not already there
        pass

    @staticmethod
    def get_chat_session_by_id_and_patient(session_id: str, patient_id: int) -> Optional[Dict[str, Any]]:
        session, _  = DatabaseService.get_session_and_messages(session_id, patient_id)
        return session

    @staticmethod
    def get_messages_for_session(session_id: str) -> List[Dict[str, Any]]:
        _, messages = DatabaseService.get_session_and_messages(session_id, 0)  # If patient check is not required
        return messages

    @staticmethod
    def create_chat_message(session_id: str, role: str, content: str) -> Optional[Dict[str, Any]]:
        try:
            return DatabaseService.make_request("POST", "/api/chat/message/", data={
                "session_id": session_id,
                "role": role,
                "content": content
            })
        except Exception as e:
            logger.error(f"Failed to create message for session {session_id}: {e}")
            return None

    @staticmethod
    def update_session_title(session_id: str, title: str) -> bool:
        try:
            # Optional: Expose a PATCH method on the DB ChatViewSet to update title
            return DatabaseService.make_request("POST", f"/api/chat/rename_session/", data={
                "session_id": session_id,
                "title": title})
        except Exception as e:
            logger.error(f"Failed to update title for session {session_id}: {e}")
            return False

    @staticmethod
    def delete_chat_session(session_id: str, patient_id: int) -> bool:
        try:
            return DatabaseService.make_request("DELETE", f"/api/chat/{session_id}/delete/?patient_id={patient_id}")
        except Exception as e:
            logger.error(f"Failed to delete session {session_id}: {e}")
            return False

    @staticmethod
    def update_session_suggestions(session_id: str, suggestions: List[str]) -> bool:
        try:
            return DatabaseService.make_request("POST", f"/api/chat/suggestions/", data={"session_id": session_id, "suggestions": suggestions})
        except Exception as e:
            logger.error(f"Failed to update suggestions for session {session_id}: {e}")
            return False

    @staticmethod
    def get_embedding_chunks() -> List[Dict[str, Any]]:
        try:
            return DatabaseService.make_request("GET", "/api/embedding-chunks/embeddings/")
        except Exception as e:
            return []
