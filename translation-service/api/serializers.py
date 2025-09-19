from pydantic import BaseModel, Field
from typing import Union

#--- Pydantic models for data validation ---
#these classes define the expected format for API's input and output
#FastAPI uses them to automatically validate requests, parse data, and generate documentation

#defines the structure for a POST request to /translate
class TranslationRequest(BaseModel):
    text: str = Field(..., min_length=1, description="The text to be translated")
    target_language: str = Field(..., min_length=1, description="The code of the target language")

#defines the response when a new translation job is successfully submitted
class JobResponse(BaseModel):
    message: str
    request_id: str

#defines the structure for the response when fetching a job result
class Result(BaseModel):
    status: str
    result: str | None = None #string could be None if it is still proccessing
    from_cache: bool = Field(default=False, description="Indicates if the result was retrieved from the cache.")

JobOrResult = Union[JobResponse, Result]