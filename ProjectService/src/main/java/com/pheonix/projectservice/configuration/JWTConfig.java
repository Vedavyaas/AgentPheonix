package com.pheonix.projectservice.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;

import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

@Configuration
public class JWTConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http){
        http.csrf(AbstractHttpConfigurer::disable);
        http.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        http.oauth2ResourceServer(oauth -> oauth.jwt(Customizer.withDefaults()));
        http.headers(header -> header.frameOptions(HeadersConfigurer.FrameOptionsConfig::disable));
        http.authorizeHttpRequests(request -> request.requestMatchers("/h2-console/**", "/logout/**").permitAll().anyRequest().authenticated());

        return http.build();
    }

    @Bean
    RSAPublicKey rsaPublicKey(){
        return loadPublicKeyFromPem("/keys/jwt-public.pem");
    }

    @Bean
    JwtDecoder jwtDecoder(RSAPublicKey rsaPublicKey){
        return NimbusJwtDecoder.withPublicKey(rsaPublicKey).build();
    }

    private static RSAPublicKey loadPublicKeyFromPem(String classpathLocation) {
        try {
            byte[] pemBytes = new ClassPathResource(classpathLocation).getContentAsByteArray();
            String pem = new String(pemBytes, StandardCharsets.US_ASCII);
            String base64 = pem
                    .replace("-----BEGIN PUBLIC KEY-----", "")
                    .replace("-----END PUBLIC KEY-----", "")
                    .replaceAll("\\s", "");
            byte[] der = Base64.getDecoder().decode(base64);
            X509EncodedKeySpec spec = new X509EncodedKeySpec(der);
            KeyFactory kf = KeyFactory.getInstance("RSA");
            return (RSAPublicKey) kf.generatePublic(spec);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to load RSA public key from classpath: " + classpathLocation, e);
        }
    }
}