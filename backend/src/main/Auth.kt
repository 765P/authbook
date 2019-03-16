package xyz.youngbin.authbook

import io.ktor.application.*
import io.ktor.features.*
import io.ktor.html.*
import io.ktor.routing.*
import kotlinx.html.*
import io.ktor.request.*
import io.ktor.response.*
import io.ktor.sessions.*
import io.ktor.util.*
import io.ktor.http.*
import io.ktor.gson.*
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import org.joda.time.*
import org.mindrot.jbcrypt.BCrypt
import org.joda.time.*

fun Route.auth(){
    route("/auth"){
        
        // Sign Up Function
        post("/signup"){
            val params = call.receive<SignUpForm>()
            val username = params.username ?: return@post call.respond(HttpStatusCode.BadRequest, ResponseWithCode(0, "username is empty"))
            val email = params.email ?: return@post call.respond(HttpStatusCode.BadRequest, ResponseWithCode(1, "email is empty"))
            val displayName = params.displayName ?: return@post call.respond(HttpStatusCode.BadRequest, ResponseWithCode(2, "display name is empty"))
            val password = params.password ?: return@post call.respond(HttpStatusCode.BadRequest, ResponseWithCode(3, "password is empty"))
            val passwordCheck = params.passwordCheck ?: return@post call.respond(HttpStatusCode.BadRequest, ResponseWithCode(4, "password check is empty"))
            
            when {
                // Validate sign up form
                password.length < 8 -> call.respond(HttpStatusCode.BadRequest, ResponseWithCode(5, "Password must be at least 8 digits"))
                password != passwordCheck -> call.respond(HttpStatusCode.BadRequest, ResponseWithCode(6, "You have to type same value for password and password check."))
                username.length < 4 -> call.respond(HttpStatusCode.BadRequest, ResponseWithCode(7, "Username must be longer then 4 letters"))
                displayName.length < 3 -> call.respond(HttpStatusCode.BadRequest, ResponseWithCode(8, "Display name must be longer then 3 letters"))
                !emailRegex.matches(email) -> call.respond(HttpStatusCode.BadRequest, ResponseWithCode(9, "Email address is not valid."))
                DbQueries.findByUsername(username) != null -> return@post call.respond(HttpStatusCode.BadRequest, ResponseWithCode(10, "Username ${username} is already in use"))
                DbQueries.findByEmail(email) != null -> return@post call.respond(HttpStatusCode.BadRequest, ResponseWithCode(11, "Email ${email} is already in use"))
                else -> {
                    // Sign up form validated! create new user with the form data
                    val passwordHash = BCrypt.hashpw(password, BCrypt.gensalt())
                    val newUser = DbQueries.signUp(username, email, displayName, passwordHash)

                    val codeBuilder = StringBuilder()
                    for(i in 0 .. 7){
                        codeBuilder.append((0 .. 9).random().toString())
                    }
                    val code = codeBuilder.toString()
                    val now = DateTime()


                    // Send verification code via email
                    val result = Mailer.sendVerification(newUser, VerificationTypes.Email,
                        code, now.toString())
                    
                    if(result){
                        // Store verification information
                        DbQueries.genVerification(newUser, VerificationTypes.Email, BCrypt.hashpw(code, BCrypt.gensalt()), now)
                    }
                    
                    // Set Session
                    call.sessions.set(AuthbookSession(
                        newUser.id.value,
                        newUser.username, 
                        call.request.origin.remoteHost, 
                        DateTime().toString()))
                    
                    // Respond to the client
                    call.respondText("Signed Up! You can now log in with the new account. Please verify your email when loggin in.")
                }
            }
        }
        
        post("/login"){
            val params = call.receive<LoginForm>()
            val username = params.username ?: return@post call.respond(HttpStatusCode.BadRequest, ResponseWithCode(0, "username is empty"))
            val password = params.password ?: return@post call.respond(HttpStatusCode.BadRequest, ResponseWithCode(1, "password is empty"))
            when {
                // Validate login up form
                username.length < 4 -> call.respond(HttpStatusCode.BadRequest, ResponseWithCode(2, "Username must be longer then 4 letters"))
                password.length < 8 -> call.respond(HttpStatusCode.BadRequest, ResponseWithCode(3, "Password must be at least 8 digits"))
                else -> {
                    val user = DbQueries.findByUsername(username) ?: return@post call.respond(HttpStatusCode.Unauthorized, ResponseWithCode(4, "User not found"))
                    if(BCrypt.checkpw(password, user.passwordHash)){
                        // Set Session
                        call.sessions.set(AuthbookSession(
                            user.id.value,
                            user.username, 
                            call.request.origin.remoteHost, 
                            DateTime.now().toString()))

                        // Respond to the client
                        call.respond(UserData(user.username, user.displayName, user.email, !user.seedKeyHash.isEmpty(), false))
                    }else{
                        // Respond to the client
                        call.respond(HttpStatusCode.Unauthorized, ResponseWithCode(5, "Password dose not matches!"))
                    }
                }
            }
        }
        
        get("/logout"){
            // Clear session when logging out
            call.sessions.clear<AuthbookSession>()
        }

        post("/recover"){
            val params = call.receive<PasswordRecoverForm>()
        }
        
        put("/verify"){
            val params = call.receive<EmailVerificationForm>()
        }
    }
}