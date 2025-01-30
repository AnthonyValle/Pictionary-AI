import os
import numpy as np
import keras
from keras import layers
import tensorflow as tf
import matplotlib.pyplot as plt

# Image parameters
imageSize = (300, 300)
batchSize = 128

# Training and validation sets
train_ds, val_ds = keras.utils.image_dataset_from_directory(
    "Images",
    validation_split=0.33,
    subset="both",
    seed=345,
    image_size=imageSize,
    batch_size=batchSize,
)

# Class count
classCount = len(train_ds.class_names)

# Input Shape
# length x width x color channels (rgb)
inputShape = (300, 300, 3)

# Function which created model
def makeModel(inputShape, classCount) :
    input = layers.Input(shape=inputShape)
    x=layers.Rescaling(1./255)(input)
    x=layers.Conv2D(3, 3, padding='same')(x)
    x = keras.layers.LeakyReLU()(x)
    x = keras.layers.MaxPooling2D()(x)
    x=layers.Conv2D(5, 3, padding='same')(x)
    x = keras.layers.LeakyReLU()(x)
    x = keras.layers.MaxPooling2D()(x)
    x=layers.Conv2D(12, 3, padding='same')(x)
    x = keras.layers.LeakyReLU()(x)
    x = keras.layers.MaxPooling2D()(x)
    x=layers.Conv2D(18, 3, padding='same')(x)
    x = keras.layers.LeakyReLU()(x)
    x = keras.layers.MaxPooling2D()(x)
    x=layers.Flatten()(x)
    x=layers.Dense(12)(x)
    x = keras.layers.LeakyReLU()(x)
    outputs=layers.Dense(classCount, activation='softmax')(x)
    return keras.Model(input, outputs)


# Call and create model
model = makeModel(inputShape, classCount)

# Configure the model
model.compile(optimizer='adam',
              loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=False),
              metrics=['accuracy'])

# Train the model
model.fit(
  train_ds,
  validation_data=val_ds,
  epochs=30
)
model.save('model.keras', overwrite=True)
print("Model saved")