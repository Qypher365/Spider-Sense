from fastapi import FastAPI

app = FastAPI(title="Spider-Sense API")

@app.get("/")
def home():
    return {"status": "API is online"}