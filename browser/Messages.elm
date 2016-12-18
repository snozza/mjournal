module Messages exposing (Msg(..))

import Http
import Model

type Msg
    = ClickNext
    | ClickPrevious
    | CloseMenu
    | CreateEntry String
    | DeleteEntry1 Model.Entry
    | DeleteEntryDone (Result Http.Error ())
    | SetNewEntryBody String
    | CreateEntryDone (Result Http.Error Model.Entry)
    | GetEntriesDone (Result Http.Error (List Model.Entry))
    | InputEmail String
    | InputPassword String
    | SaveEntry Model.Entry String
    | SaveBodyDone (Result Http.Error ())
    | SetTheme Model.Theme
    | SetThemeDone (Result Http.Error ())
    | SignIn
    | Register
    | SignInDone (Result Http.Error Model.User)
    | ToggleMenu String