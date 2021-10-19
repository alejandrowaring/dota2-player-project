# dota2-player-project

## Project Proposal

This project will allow a user to input their Steam Name and return statistics and visualizations on the last game they played.

## API Called Data vs MongoDB Called Data

Within the opendota API there are two groups of data
 - Player/Match Data
 - Game Data

The Player/Match data is consantly changing as players play more games, while the Game Data is somewhat static, only changing when the game is patched. For this reason the website uses a database to hold the more static data to save on time and costs (higher tier API requires payment). The player/match data will be called on demand directly from the opendota API.


## Planned Visualizations/Data Sets

Once the user inputs their user, the website will return the following statistics:
 - Last Match Performance
 - Player Statistics
 - Hero Played Information
 - Core Game information
 - Extra Game information

## Interactivability
There will be 2 forms if interactivability
 - Drilling down in the advantages graph to get insights on a minute by minute basis
 - Ability to input any players name and return the information based on their last game.

## Data sets
https://docs.opendota.com/

