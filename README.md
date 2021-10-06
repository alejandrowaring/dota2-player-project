# dota2-player-project

## Project Proposal

This project will allow an end user to enter their Steam ID and have the web page return statistics on their past 100 ranked matches (as a default), and analyize the game to find trends in their behaviour to provide insights on how the user can improve their game play. The following statistics will be returned to the user:
 - Overall Win/Loss Rate
 - Recent Win/Loss Rate
 - Most successful Heros
 - 


## API Called Data vs MongoDB Called Data

Within the opendota API there are two groups of data
 - Player/Match Data
 - Game Data

The Player/Match data is consantly changing as players play more games, while the Game Data is somewhat static, only changing when the game is patched. For this reason the website uses a database to hold the more static data to save on time and costs (higher tier API requires payment). The player/match data will be called on demand directly from the opendota API.


## Planned Visualizations/Data Sets

Once the user inputs their user, the website will return statistics based on their choice of:
 - Last Match Performance
 - Last X Match Performance Aggregate (Defaulting at 50)
 - Comparisons vs players next rank level up.

## Data sets
https://docs.opendota.com/

