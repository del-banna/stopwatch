import sys
import subprocess

chromePath = "C:\Program Files (x86)\Google\Chrome\Application\Chrome.exe"
pageURL = "https://skr10s.000webhostapp.com/stopwatches/main" #"http://localhost:8080/stopwatches.html"


if __name__ == "__main__":
    filePath = sys.argv[1]
    file = open(filePath, 'r')
    text = file.read()
    file.close()
    url = f"{pageURL}?list={text}"
    subprocess.call([chromePath, url])

