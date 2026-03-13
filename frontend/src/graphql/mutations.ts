import { gql } from "@apollo/client";

export const REGISTER_PLAYER = gql`
  mutation RegisterPlayer(
    $seasonId: ID!
    $name: String!
    $email: String!
    $ratings: [RatingInput!]!
  ) {
    registerPlayer(
      seasonId: $seasonId
      name: $name
      email: $email
      ratings: $ratings
    ) {
      ok
      error
      player {
        id
        name
      }
    }
  }
`;
