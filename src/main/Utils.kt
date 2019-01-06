package xyz.youngbin.authbook

import javax.crypto.*
import javax.crypto.spec.*
import io.ktor.application.*

val emailRegex = Regex("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$")

fun hash(password: String): String {
    val hmac = Mac.getInstance("HmacSHA512")
    hmac.init(hmacKey)
    return hmac.doFinal(password.toByteArray(Charsets.UTF_8)).toString()
}