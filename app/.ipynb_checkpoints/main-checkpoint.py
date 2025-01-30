from flask import Flask, render_template, url_for, request

import base64 

import functions

app = Flask(__name__)

@app.route("/")
def main():
    return render_template("index.html")

@app.route('/process', methods=['POST']) 
def process(): 
    data = request.form.get('data') 
    result = data.upper() 
    print(data)
    functions.downloadImage(data)
    return result 

if __name__ == "__main__":
    app.run(debug=True)