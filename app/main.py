# Flask
from flask import Flask, render_template, url_for, request, jsonify, redirect

# Machine Learning
import keras
import tensorflow as tf
import numpy as np

# Decoding Base64
from PIL import Image
from io import BytesIO
import base64

# os
import os

# Checking versions
print(tf.__version__)
print(keras.__version__)

# Load model
model = keras.models.load_model("model.keras", compile=True)

prediction = None
app = Flask(__name__)

classNames = ["cup", "flower", "happy face", "leaf", "star"]

@app.route("/")
def main():
    return render_template("index.html")

# This route is the endpoint of the image pipeline to help train the model
# /process/<className> takes the current state of the frontend canvas as a Base64 Encoding, decodes it and uploads to its proper folder using the <className> parameter
@app.route('/process/<className>', methods=['POST'])
def process(className):
    global number
    data = request.form.get('data')
    result = data.upper()

    # Decode Base64 Data
    base64_string = data.split(',')[1]
    img_data = base64.b64decode(base64_string)
    img = Image.open(BytesIO(img_data))

    # Crop image
    width, height = img.size
    overflowX = (width - 375)/2
    overflowY = (height - 400)/2
    img = img.crop((overflowX, 0, width-overflowX, height-overflowY))

    # Grabs the total number of photos in designated directory to supply unique filename
    number = len(os.listdir(f'Images/{className}'))
    filePath = os.path.join(f"Images/{className}", f"image{number}.jpg")
    img.save(filePath)

    return result

# This route makes updates the directory "guessingImage" which is where the model looks to predict
# predict() is called which returns the prediction and the new value of a global variable "prediction"
@app.route('/prediction', methods=['POST'])
def prediction():
    global prediction
    data = request.form.get('data')
    result = data.upper()

    base64_string = data.split(',')[1]
    img_data = base64.b64decode(base64_string)
    img = Image.open(BytesIO(img_data))
    width, height = img.size
    overflowX = (width - 375)/2
    overflowY = (height - 400)/2
    img = img.crop((overflowX, 0, width-overflowX, height-overflowY))
    filePath = os.path.join("guessingImage", f"image.jpg")
    img.save(filePath)
    result = predict()
    prediction = result
    return redirect(url_for('fetch'))

# fetch route which responds with the prediction
@app.route('/fetch', methods=['GET'])
def fetch():
    global prediction
    return jsonify({"result": prediction})



# Route which decodes the base64 encoding of the frontend canvas to make a prediction
def predict():
    img = keras.utils.load_img("guessingImage/image.jpg", target_size=(300,300))

    img_array = keras.utils.img_to_array(img)
    img_array = np.expand_dims(img_array, 0)  # Create batch axis


    predictions = model.predict(img_array)

    return (classNames[np.argmax(predictions[0])])


if __name__ == "__main__":
    app.run(debug=True)





