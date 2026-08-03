package com.smartoa.security;
import io.jsonwebtoken.*; import io.jsonwebtoken.security.Keys; import org.springframework.beans.factory.annotation.Value; import org.springframework.stereotype.Service; import javax.crypto.SecretKey; import java.nio.charset.StandardCharsets; import java.time.*; import java.util.Date;
@Service public class JwtService { private final SecretKey key; private final long expiration;
 public JwtService(@Value("${oa.jwt.secret}") String secret,@Value("${oa.jwt.expiration-seconds:7200}") long expiration){this.key=Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));this.expiration=expiration;}
 public String create(String username){Instant now=Instant.now();return Jwts.builder().subject(username).issuedAt(Date.from(now)).expiration(Date.from(now.plusSeconds(expiration))).signWith(key).compact();}
 public String parse(String token){return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload().getSubject();}
}
