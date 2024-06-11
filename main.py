from fastapi import FastAPI, Form, Request, HTTPException
from fastapi.responses import JSONResponse, HTMLResponse
import uvicorn
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import tensorflow as tf
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.preprocessing.text import Tokenizer
import numpy as np
import pickle
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load tokenizer and model
try:
    with open('models/tokenizer.pkl', 'rb') as handle:
        tokenizer = pickle.load(handle)
    model = tf.keras.models.load_model('models/first_model')
except Exception as e:
    logger.error("Error loading model or tokenizer: %s", e)
    raise

max_len = 22

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

class TextInput(BaseModel):
    text: str

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/predict/", response_model=list)
async def predict_next_word(input: TextInput):
    if not input.text:
        raise HTTPException(status_code=400, detail="Text input is required")
    next_words = predict_next(input.text)
    if not next_words:
        raise HTTPException(status_code=500, detail="Prediction failed")
    return next_words

def predict_next(text):
    try:
        text=text.strip()
        token_text = tokenizer.texts_to_sequences([text])[0]
        padded_token_text=pad_sequences([token_text],maxlen=max_len-1,padding='pre')
        preds =model.predict(padded_token_text)
        top_indices = np.argsort(preds[0])[-5:][::-1]  # Get top 5 predictions
        next_words = [word for word, index in tokenizer.word_index.items() if index in top_indices]
        return next_words
    except Exception as e:
        logger.error("Error in prediction: %s", e)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
