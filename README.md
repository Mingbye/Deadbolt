# deadbolt (node.js)

deadbolt is an opinionated (but ensuring high customizability), simple to use, and thoroughly tested user sign-ins helper library for node.js.

The library is meant to help work around implementing the classics:- "sign-up", "sign-in", "forgot password" ... with minimum efforts and code.

## Installing

```
npm install @mingbye/deadbolt
```

## Usage

Create a deadbolt app by instatiating the Deadbolt class to introduce the structure of your app and obtain access to the different functionalities of deadbolt.

```js
const Deadbolt = require("@mingbye/deadbolt");

const deadbolt = new Deadbolt(...);
```

**Note**: Recommended to create a deadbolt instance for each group that may have different accounts auth rules for accessing your system. For example:-

```js
const deadboltUsers = new Deadbolt(...);

const deadboltMerchants = new Deadbolt(...);

const deadboltAdmins = new Deadbolt(...);
```

The Deadbolt class constructor receives an argument - object of keys appName: string, modules: {}

The modules object takes in keys "signin","signup"... These are all optional although errors may occur depending on your code flow

```js
const deadbolt = new Deadbolt({
    appName: "my-app",
    modules: {
        signin: new Deadbolt.Signin(...),
        signup: new Deadbolt.Signup(...),
    },
});
```

### > Deadbolt.Signup

Create an instance of the Deadbolt.Signup class to introduce the structure of your sign-up process.

The methods parameter can take in different keys each mapping as a name to a sign-in method.

```js
new Deadbolt.Signup({
    methods: {
        "emailPassword1": ...,
        "mySignupMethod2": new Deadbolt.Signup.Id(...),
    },
});
```

**Caution**: The keys such as "mySignupMethod2", must be unique in their respective module objects and they must be url friendly (exclude special characters for urls like / : \\ @ #) otherwise errors may occur. Bad keys examples include:- "mySignup/Method", "my@Signup:Method#"

#### 1. Deadbolt.Signup.Id

Create an instance of this method if you want to provide an input for one to input an identifier for a sign-up which deadbolt provides diffrent variants

```js
new Deadbolt.Signup.Id({
    variant: "emailAddress", // "phonenumer" | "username" | "emailAddressOrPhonenumber" ...
    trimInput: true, //whether the user can only submit an id without white space on the side
    signup: async (id) => {
        //await do some work

        //logic here may return or throw the following results

        //case: you want to complete the sign-up process successful
        //returning Success assumes that you have already creeated a new user and obtained a USER-REF
        return new Deadbolt.Signup.Success({
            user: `USER-REF`,
            createAutoSigninToken: async () => {
                return `TOKEN-REF`;
            }, //provide createAutoSigninToken: null if you want to disable auto sign-in
        });

        //case: you want whoever is signing up to create a password
        return new Deadbolt.CreatePassword({
            createStepPassToken: async () => {
                //await do some work
                return `TOKEN-REF`;
            },
        });

        //case: you've flagged the email-address as invalid
        throw new Deadbolt.Signup.Id.RejectedError({
            variant: `invalid`, //in other cases their are variants like "inUseOrUnavailalbe" for when the id (emailAddress in this case) is taken or reserved
            customMessage: null, //the front-end will provide a message depending on the variant but will append to it this customMessage if you define it
        });

        //case: you've sent a 2FA code to the [id] or another email-address
        return new Deadbolt.ConfirmForeignCode({
            codeWhere: "sentInEmail", //or like "sentInSms"... this means you will provide a phone-number in the field "codeWhereIdentifier"
            codeWhereIdentifier: id, //like the email address to which the code has been sent
            createStepPassToken: async () => {
                //await do some work
                return `TOKEN-REF`;
            },
        });

        //throwing any other error inside here will not kill the process. However it will send a 500 status response to the front end
    },

    createPassword: async (data, password) => {
        //provide this method if you have returned Deadbolt.CreatePassword somewhere

        //the data object contains information like data.stepPassToken which was created before by your result and password is what the user has submitted

        //await do some work

        //case: the password is weak
        throw new Deadbolt.CreatePassword.RejectedError({
            variant: "weak", //or like "lengthShort" | "lengthLong" or null
            customMessage: "Password should include an uppercase letter and a symbol",
        });

        //case:
        return new Deadbolt.Signup.Success({
            user: `USER-REF`,
            createAutoSigninToken: async () => {
                return `TOKEN-REF`;
            },
        });

        //you can still return a confirm foreign code

        //some errors like Deadbolt.ConfirmForeignCode.RejectedError expected here so throwing them will be treated just like another http status 500 error
    }

    confirmForeignCode: ... //similar sense as of createPassword

    autoSignin: async (user, autoSigninToken) => {
        // provide this method to handle auto sign in after the user auto matically signs-up. Not defining this will fail auto sign-in if ever invoked

        //await do some work
        return `SIGNIN-REF`;

        //needn't be worried of recklessly throwing an error. It will be received by the front-end as an http status 500 response
    },
});
```

### > Deadbolt.Signin

Create an instance of the Deadbolt.Signin class to introduce the structure of your sign-in process.

The methods parameter can take in different keys each mapping as a name to a sign-in method.

```js
new Deadbolt.Signin({
    methods: {
        "mySigninMethod1": ...
        "mySigninMethod2": new Deadbolt.Signin.Google(...),
    },
});
```

**Caution**: The keys such as "mySigninMethod1", must be unique in their respective module objects and they must be url friendly (exclude special characters for urls like / : \\ @ #) otherwise errors may occur. Bad keys examples include:- "mySignin/Method", "my@Signin:Method#"

#### 1. Deadbolt.Signin.Id

Create an instance of this method if you want to provide an input for one to input an identifier for a sign-in which deadbolt provides diffrent variants

```js
// for any unexplained parts, try referencing the similarities in logic from Deadbolt.Signup.Id

new Deadbolt.Signin.Id({
    variant: "emailAddress",
    trimInput: true,
    withPassword: true, //whether the sign-in form should include a password field.
    useSigninMethod: async (id,password) => {
        //await do some work. Password may be null if withPassword is false

        //logic here may return or throw the following results

        //case: you want to complete the sign-up process successful
        return new Deadbolt.Signin.Success({
            user: `USER-REF`,
            createSignin: async () => {
                return `SIGNIN-REF`;
            },
        });

        //case: you want whoever is signing up to create a password
        return new Deadbolt.CreatePassword(...);

        //case: no match to a sign-in method or password is incorrect
        throw new Deadbolt.Signin.Id.RejectedError({
            variant: `noMatch`,
            customMessage: null,
        });

        //case: you've sent a 2FA code to the [id] or another email-address
        return new Deadbolt.ConfirmForeignCode(...);

        //throwing any other error inside here will not kill the process. However it will send a 500 status response to the front end
    },

    createPassword: ...,

    confirmForeignCode: ...,
});
```

### Finishing

#### express

deadbolt instance .express is a getter that returns an express route function.

```js
const express = require("express");
const Deadbolt = require("@mingbye/deadbolt");

const expressApp = express();

const deadboltUser = new Deadbolt(...);
const deadboltCreator = new Deadbolt(...);
const deadboltDataAdmin = new Deadbolt(...);

//samples ...

expressApp.use("/deadbolt-app", deadboltUser.express);
//functions reaching deadboltUser will be served at /deadbolt-app

expressApp.use("/deadbolt_creator", deadboltCreator.express);
//....

expressApp.use("/deadbolt/admin/data", deadboltDataAdmin.express);
//....


//using Deadbolt Auto, you can for instance have a user sign-up at /deadbolt-app/auto/#signup
//or a data admin sign-in at /deadbolt/admin/data/auto/#signin

expressApp.listen(...)
```

### Deadbolt Auto

Depending on whether you are serving deadbolt with express for example, Deadbolt Auto is provided within as a web app that you can link your users to so as to interact with your app.

The table below shows different url-suffix-es you can use to link the user to different functionalities of Deadbolt Auto depending on your objective.

Using the express example above (assuming server at address <https://myapp.com>), sample links from the table below can be

1. <https://myapp.com/deadbolt_creator/auto/#signin>

2. <https://myapp.com/deadbolt-app/auto/#signup?signin=true>


| objective | url-suffix | result |
|-|-|-|
| Want one to sign-in only | /auto/#signin | SigninResult: {user:string,signin:string} |
| Want one to sign-in (and can create a new account) [default to sign-in] | /auto/#signin?optSignup=true | SigninResult: {user:string,signin:string} |
| Want one to sign-in (and can create a new account) [default to sign-up] | /auto/#signup?signin=true | SigninResult: {user:string,signin:string} |
| Want one to sign-up only (the result [user and autoSign] can still be used to invoke auto sign-in afterwards) | /auto/#signup | SignupResult: {user:string,autoSignin:string?} |

#### Getting the Deadbolt Auto result - Examples

The result is a value that can be shipped in json [number | string | json-array | json-object].

Note that if you need the result to be a string, set the search param resolveStringified to "true" then you will receive a json object stringified containing a "data" key when parsed.

If opening url in iframe :-

```js
iframeElement.src=`https://myapp.com/something/auto/#signin?optSignup=true&resolve=parent`;

window.addEvenListener(`message`, (ev) => {
    if(ev.source == iframeElement.contentWindow){
        if(ev.origin !== "https://myapp.com"){
            return;
        }

        const signinResult = ev.data;
        //.... const {user, signin} = signinResult;
    }
});

//"resolve" is set to "parent"
```

If opening url in popup window :-

```js
const popup=window.open(`https://myapp.com/auto/#signup?resolve=opener`);

window.addEvenListener(`message`, (ev) => {
    if(ev.source == popup){
        if(ev.origin !== "https://myapp.com"){
            return;
        }

        const signupResult = ev.data;
        //.... const {user, autoSigninToken} = signupResult;
    }
});

//"resolve" is set to "opener"
```

If opening url using a technology like Flutter (webview_flutter) where you get to use "JavaScript Channels". Set the target channel name to "ResolveChannel"


```dart
controller.addJavaScriptChannel(
    "ResolveChannel",
    onMessageReceived: (message) {
        final Map signupResult = json.decode(message.message); //use resolveStringified in url because message.message only accepts Strings as of webview_flutter 4.10.0

        final String user = signupResult["user"];
        final String? autoSigninToken = signupResult["autoSigninToken"];
        //....
    }
);
    
controller.loadRequest(Uri.parse('https://myapp.com/auto/#signup?resolve=channel&resolveStringified=true'));

//"resolve" is set to "channel"
```