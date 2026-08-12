## Overview
Displays information relevant to our daily standup

## How to Use

### Running the App
If you want to start using the app immediately, create an Custom HTML app on your Rally dashboard and copy and paste [this](https://raw.githubusercontent.com/robgura/OpenStoriesTasksAndDefects/master/deploy/App.html)

## Development

### Steps
```
npm install
npm run watch
cd deploy
python -m SimpleHTTPServer
python3 -m http.server 8000
```
Note: You can also use `python3 -m http.server 8000`

At this point you can point your browser at `http://{IP}:8000/`

### Finished
```
npm run build # Updates the file deploy/index.html
```
Post that file to rally
