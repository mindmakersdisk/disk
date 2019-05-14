import requests

# This function will pass your text to the machine learning model
# and return the top result with the highest confidence
def classify(text):
    key = "4a73fc80-764f-11e9-b20c-2d84921d27608cdab449-23ea-4a87-b3b2-48c8fae1b041"
    url = "https://machinelearningforkids.co.uk/api/scratch/"+ key + "/classify"

    response = requests.get(url, params={ "data" : text })

    if response.ok:
        responseData = response.json()
        topMatch = responseData[0]
        return topMatch
    else:
        response.raise_for_status()


# CHANGE THIS to something you want your machine learning model to classify
texto = raw_input("Texo a ser analisado: ")
demo = classify("'%s'" %texto)

label = demo["class_name"]
confidence = demo["confidence"]


# CHANGE THIS to do something different with the result
print ("result: '%s'." % (label))
print ("confidence: %d%%." % (confidence))
