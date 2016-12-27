module Pagination exposing (toolbar, init)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onClick, onInput)
import Http
import List
import Events exposing (onEnter)
import Messages exposing (Msg)
import Model exposing (Model)
import Navigation
import Location exposing (location)

init : Model.Flags -> Model.PageState
init flags =
    { after = Nothing
    , before = Nothing
    , pageSize = 50
    , textSearch = ""
    , screen =
        case flags.id of
            Just id ->
                Model.EntriesScreen

            Nothing ->
                Model.SignInScreen
    }


enablePrevious : Model -> Bool
enablePrevious model =
    case model.pageState.before of
        Nothing ->
            case model.pageState.after of
                Nothing ->
                    True

                Just _ ->
                    True

        Just _ ->
            List.length model.entries == model.pageState.pageSize


enableNext : Model -> Bool
enableNext model =
    case model.pageState.before of
        Nothing ->
            case model.pageState.after of
                Nothing ->
                    False

                Just _ ->
                    List.length model.entries == model.pageState.pageSize

        Just _ ->
            True



--
--
-- enablePrevious : Model -> Bool
-- enablePrevious model =
--     case model.direction of
--         Nothing ->
--             True
--
--         Just (Model.Previous) ->
--             List.length model.entries == model.pageSize
--
--         Just (Model.Next) ->
--             True
--
--
-- enableNext : Model -> Bool
-- enableNext model =
--     case model.direction of
--         Nothing ->
--             False
--
--         Just (Model.Previous) ->
--             True
--
--         Just (Model.Next) ->
--             List.length model.entries == model.pageSize


toolbar : Model -> Html Msg
toolbar model =
    div
        [ class "toolbar" ]
        [ button
            [ class "previous", disabled (not (enablePrevious model)), onClick Messages.PreviousPage ]
            --ng - click "previous()", ng - disabled "disablePrevious", data - vivaldi - spatnav - clickable "1"
            [ span
                [ class "smallText" ]
                [ text "←" ]
            , span
                [ class "fullText" ]
                [ text "Previous Entries" ]
            ]
        , span
            [ class "search" ]
            [ input
                [ type_ "text"
                , placeholder " search entries..."
                , value model.pageState.textSearch
                , onInput Messages.SetTextSearch
                , onEnter Messages.Search
                ]
                -- ng - model "textSearch", ng - keypress "searchKeypress($event)"]
                []
            , button
                [ onClick Messages.ClearTextSearch
                , class "clearTextSearch"
                , classList
                    [ ( "hidden"
                      , String.length model.pageState.textSearch == 0
                      )
                    ]
                ]
                [ text "clear" ]
            ]
        , button
            [ class "next", disabled (not (enableNext model)), onClick Messages.NextPage ]
            [ span
                [ class "fullText" ]
                [ text "Next Entries" ]
            , span
                [ class "smallText" ]
                [ text "→" ]
            ]
        ]
