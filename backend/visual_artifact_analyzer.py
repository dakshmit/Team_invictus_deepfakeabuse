import os
import json
import base64
import mimetypes
from typing import Union, Dict, Any
import google.generativeai as genai
from dotenv import load_dotenv

# 1. Load configuration
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables.")

# Configure the Gemini API
genai.configure(api_key=GEMINI_API_KEY)

def _get_model():
    """Returns the Gemini Vision model instance."""
    return genai.GenerativeModel("gemini-1.5-flash")

def analyze_visual_artifacts(image_input: Union[str, bytes]) -> Dict[str, Any]:
    """
    Performs AI-assisted visual artifact analysis on an image using Google Gemini Vision.
    
    Args:
        image_input: Either a local file path (str) or raw image bytes (bytes).
        
    Returns:
        A dictionary containing the analysis results.
    """
    try:
        # 1. Input Validation & Processing
        image_data = None
        mime_type = None

        if isinstance(image_input, str):
            # Treat as file path
            if not os.path.exists(image_input):
                return {"error": f"File not found: {image_input}"}
            
            mime_type, _ = mimetypes.guess_type(image_input)
            if mime_type not in ["image/jpeg", "image/jpg", "image/png"]:
                return {"error": "Invalid file type. Supported: jpg, jpeg, png."}
            
            with open(image_input, "rb") as f:
                image_data = f.read()
                
        elif isinstance(image_input, bytes):
            # Treat as raw bytes
            # We assume it's one of the supported types; in a production app, 
            # we might use a library like 'imghdr' or 'python-magic' to verify.
            image_data = image_input
            mime_type = "image/jpeg" # Default to jpeg for bytes
        else:
            return {"error": "Input must be a file path (str) or image bytes (bytes)."}

        # 2. Prepare Gemini Call
        return _call_gemini_vision(image_data, mime_type)

    except Exception as e:
        return {"error": f"Unexpected error during analysis: {str(e)}"}

def _call_gemini_vision(image_bytes: bytes, mime_type: str) -> Dict[str, Any]:
    """Internal function to handle the multimodal Gemini Vision API call."""
    model = _get_model()
    
    # Exact prompt as requested
    prompt = """
    You are a digital forensic assistant.
    Analyze the provided image for potential visual inconsistencies.
    Look for:
    - Unnatural facial textures or blending
    - Lighting or shadow mismatches
    - Edge artifacts around facial features
    - Distortions commonly associated with AI-generated or morphed images

    Important rules:
    - Do NOT make definitive claims
    - Do NOT label the image as fake or real
    - Provide observations only

    Return your response strictly in JSON with:
    {
      "visual_observations": [],
      "possible_indicators": [],
      "risk_level": "Low | Medium | High",
      "legal_safe_summary": "Short neutral explanation suitable for a complaint"
    }
    """

    try:
        # Compose multimodal input
        contents = [
            prompt,
            {"mime_type": mime_type, "data": image_bytes}
        ]
        
        response = model.generate_content(contents)
        
        # 3. Output Parsing
        response_text = response.text.strip()
        
        # Handle cases where Gemini wraps JSON in markdown blocks
        if response_text.startswith("```json"):
            response_text = response_text[7:-3].strip()
        elif response_text.startswith("```"):
            response_text = response_text[3:-3].strip()
            
        return json.loads(response_text)

    except json.JSONDecodeError:
        return {"error": "API returned malformed JSON response."}
    except Exception as e:
        return {"error": f"Gemini API Error: {str(e)}"}

# 4. Example Usage
if __name__ == "__main__":
    # To test, provide a path to a local image
    # Note: For production use, this result would be shown in the console as per requirements
    TEST_IMAGE_PATH = "path/to/your/test_image.jpg" 
    
    if os.path.exists(TEST_IMAGE_PATH):
        print(f"--- Starting Analysis on {TEST_IMAGE_PATH} ---")
        result = analyze_visual_artifacts(TEST_IMAGE_PATH)
        
        # Check risk level for decision logic
        risk = result.get("risk_level", "Low")
        
        # Requirements: Show results in console for testing
        print(json.dumps(result, indent=2))
        
        if risk == "Low":
            print("\n[LOGIC] Risk Level Low: Redirecting to chat support for general assistance...")
        else:
            print(f"\n[LOGIC] Risk Level {risk}: Forensic indicators found. Legal draft prepared.")
    else:
        print("Note: Provide a valid file path in TEST_IMAGE_PATH to run the example usage.")
