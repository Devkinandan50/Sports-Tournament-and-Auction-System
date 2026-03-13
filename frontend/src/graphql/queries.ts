import { gql } from "@apollo/client";

export const GET_NOTICES = gql`
  query GetNotices($seasonId: ID!) {
    notices(seasonId: $seasonId) {
      id
      title
      content
      createdAt
    }
  }
`;

export const GET_AUCTION_CONFIG = gql`
  query GetAuctionConfig($seasonId: ID!) {
    auctionConfig(seasonId: $seasonId) {
      id
      registrationOpen
      auctionActive
      minBidPrice
      initialBudget
      rules
    }
  }
`;

export const GET_SPORTS = gql`
  query GetSports($seasonId: ID!) {
    sports(seasonId: $seasonId) {
      id
      name
      displayOrder
      placePoints {
        id
        place
        points
      }
    }
  }
`;

export const GET_TEAMS = gql`
  query GetTeams($seasonId: ID!) {
    teams(seasonId: $seasonId) {
      id
      name
      captainName
      logo
      remainingBudget
      playerCount
    }
  }
`;

export const GET_TEAM = gql`
  query GetTeam($id: ID!, $seasonId: ID!) {
    team(id: $id) {
      id
      name
      captainName
      logo
      remainingBudget
      playerCount
      players {
        id
        name
        companyEmail
        photo
        soldPrice
        isSold
        ratings {
          sportName
          rating
        }
      }
    }
    auctionConfig(seasonId: $seasonId) {
      initialBudget
    }
  }
`;

export const GET_PLAYERS = gql`
  query GetPlayers(
    $seasonId: ID!
    $sportId: ID
    $minRating: Int
    $unsoldOnly: Boolean
    $search: String
    $sortBy: String
  ) {
    players(
      seasonId: $seasonId
      sportId: $sportId
      minRating: $minRating
      unsoldOnly: $unsoldOnly
      search: $search
      sortBy: $sortBy
    ) {
      id
      name
      companyEmail
      photo
      isSold
      soldPrice
      team {
        id
        name
      }
      ratings {
        sport {
          id
          name
        }
        sportName
        rating
      }
    }
  }
`;

export const GET_LEADERBOARD = gql`
  query GetLeaderboard($seasonId: ID!) {
    leaderboard(seasonId: $seasonId) {
      teamId
      teamName
      captainName
      logo
      totalPoints
      sportPoints {
        sportId
        sportName
        place
        points
      }
    }
  }
`;

export const GET_MATCH_RESULTS = gql`
  query GetMatchResults($seasonId: ID!, $sportId: ID) {
    matchResults(seasonId: $seasonId, sportId: $sportId) {
      id
      sportName
      teamName
      place
      points
      createdAt
    }
  }
`;
