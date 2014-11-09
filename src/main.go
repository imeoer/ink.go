package main

import (
    "bamboo"
    "encoding/json"
    "ink"
    "fmt"
)

/* helper method */

func preHandle(ctx *ink.Context) {
    ctx.Header().Set("Content-Type", "application/json;charset=UTF-8")
    // auth check
    path := ctx.Req.URL.Path
    if path != "/login" && path != "/register" {
        userId := ctx.TokenGet("id")
        if userId == nil {
            returnRet(ctx, false, "auth failed")
            ctx.Stop()
            return
        }
    }
    // parse request json data
    decoder := json.NewDecoder(ctx.Req.Body)
    data := make(bamboo.MapData)
    err := decoder.Decode(&data)
    if err != nil {
        fmt.Println(err)
    }
    ctx.Ware["data"] = data
}

func returnRet(ctx *ink.Context, status bool, result interface{}) {
    data := bamboo.MapData{
        "status": status,
        "result": result,
    }
    ret, _ := json.Marshal(data)
    ctx.Write(ret)
}

func getParam(ctx *ink.Context, key string) string {
    data := ctx.Ware["data"].(bamboo.MapData)
    return data[key].(string)
}

/* logic handler */

func login(ctx *ink.Context) {
    mail := getParam(ctx, "mail")
    pass := getParam(ctx, "pass")
    userId := bamboo.UserLogin(mail, pass)
    if userId != 0 {
        token := ctx.TokenNew()
        ctx.TokenSet("id", userId)
        returnRet(ctx, true, token)
        return
    }
    returnRet(ctx, false, nil)
}

func register(ctx *ink.Context) {
    mail := getParam(ctx, "mail")
    pass := getParam(ctx, "pass")
    if bamboo.UserExist(mail) {
        returnRet(ctx, false, "exist")
        return
    }
    ok := bamboo.UserRegister(mail, pass)
    if ok {
        returnRet(ctx, true, nil)
        return
    }
    returnRet(ctx, false, "failed")
    return
}

func main() {
    app := ink.App()
    // middleware
    app.Get("*", ink.Static("public"))
    app.Post("*", preHandle)
    // route handler
    app.Post("/test", func (ctx *ink.Context) {
        returnRet(ctx, true, nil)
    })
    app.Post("/login", login)
    app.Post("/register", register)
    // start server
    app.Listen("0.0.0.0:9090")
}
