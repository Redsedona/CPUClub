/* global db */

// FirebaseUI config.
var uiConfig = {
    callbacks: {
        signInSuccess: function (currentUser, credential, redirectUrl) {
            // Do something.
            // Return type determines whether we continue the redirect automatically
            // or whether we leave that to developer to handle.
            return true;
        },
        uiShown: function () {

        }
    },
    credentialHelper: firebaseui.auth.CredentialHelper.ACCOUNT_CHOOSER_COM,
    // Query parameter name for mode.
    queryParameterForWidgetMode: 'mode',
    // Query parameter name for sign in success url.
    queryParameterForSignInSuccessUrl: 'signInSuccessUrl',
    // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
    signInFlow: 'popup',
    signInSuccessUrl: window.location.href,
    signInOptions: [
        // Leave the lines as is for the providers you want to offer your users.
        {
            provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
            // Whether the display name should be displayed in the Sign Up page.
            requireDisplayName: true
        },
        firebase.auth.GoogleAuthProvider.PROVIDER_ID
        /*{
            provider: firebase.auth.GithubAuthProvider.PROVIDER_ID,
            scopes: ['read:user']
        },*/
        
    ],
    // Terms of service url.
    tosUrl: '<your-tos-url>'
};

var ui = new firebaseui.auth.AuthUI(firebase.auth());
// The start method will wait until the DOM is loaded.
ui.start('#firebaseui-auth-container', uiConfig);

var clubuser = null;

initApp = function () {
    firebase.auth().onAuthStateChanged(function (user) {
        $('#loginModal').modal('hide');
        
        if (user) {            
            // User is signed in.
            getClubUser(user.uid, user);
            
            $('#sign-in').hide();
            $('#sign-out').show();            
        } else {
            // User is signed out.                        
            $('#sign-in').show();
            $('#sign-out').hide();
            $('#username').text("");
            $('.admin').hide();
            $('.member').hide();
            clubuser = null;
        }
    }, function (error) {
        console.log(error);
    });
};

window.addEventListener('load', function () {
    initApp();
});

function getClubUser(uid, authuser) {
    var usersColl = db.collection('users');
    var userDoc = usersColl.doc(uid);
    
    userDoc.get().then(function(doc) {
        if(doc.exists) {
            setClubUser(doc.data());
        }
        else {           
            userDoc.set({name: authuser.displayName, 
                        pic: authuser.photoURL,
                        affiliation: ""
                       }).then(getClubUser(uid, authuser));    
        }
    });
        
    var rolesDoc = usersColl.doc('Roles');
    
    rolesDoc.get().then(function(doc) {
        if (doc.exists) {
            if ($.inArray(uid, doc.data.member)) {
                $('.member').show();
            }
            else {
                $('.member').hide();
            }
            
            if ($.inArray(uid, doc.data.admin)) {
                $('.admin').show();
            }
            else {
                $('.admin').hide();
            }
        }
    });
}

function setClubUser(data) {
    clubuser = data;
    $('#username').text("(" + data.name + ")");
    
}
