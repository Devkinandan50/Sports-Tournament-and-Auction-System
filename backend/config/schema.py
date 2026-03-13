import graphene

from apps.core.schema import Query as CoreQuery
from apps.teams.schema import Mutation as TeamsMutation
from apps.teams.schema import Query as TeamsQuery
from apps.tournament.schema import Query as TournamentQuery


class Query(CoreQuery, TeamsQuery, TournamentQuery, graphene.ObjectType):
    pass


class Mutation(TeamsMutation, graphene.ObjectType):
    pass


schema = graphene.Schema(query=Query, mutation=Mutation)
