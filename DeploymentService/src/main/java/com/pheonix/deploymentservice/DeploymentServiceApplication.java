package com.pheonix.deploymentservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DeploymentServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(DeploymentServiceApplication.class, args);
    }

}
