package bamboo

import (
    "ink"
    "regexp"
    "encoding/json"
    "net/mail"
)

/* helper method */
func PreHandle(ctx *ink.Context) {
    // auth check
    path := ctx.Req.URL.Path
    if path != "/user/login" && path != "/user/register" {
        userId := ctx.TokenGet("id")
        if userId == nil {
            returnRet(ctx, false, "auth failed")
            ctx.Stop()
            return
        }
    }
    // parse request json data
    decoder := json.NewDecoder(ctx.Req.Body)
    data := make(Map)
    err := decoder.Decode(&data)
    if err != nil {
        returnRet(ctx, false, "json parse error")
        ctx.Stop()
        return
    }
    ctx.Ware["data"] = data
}

func returnRet(ctx *ink.Context, status bool, result interface{}) {
    data := Map{
        "status": status,
        "result": result,
    }
    ret, _ := json.Marshal(data)
    ctx.Write(ret)
}

func getParam(ctx *ink.Context, key string) interface{} {
    data := ctx.Ware["data"].(Map)
    return data[key]
}

func validate(regex string, value string) bool {
    ok, err := regexp.MatchString(regex, value)
    if err == nil && ok {
        return true
    }
    return false
}

func validType(method string, value string) bool {
    if method == "mail" {
        mail, err := mail.ParseAddress(value)
        if err == nil && mail.Name == "" {
            return true
        }
    }
    return false
}
