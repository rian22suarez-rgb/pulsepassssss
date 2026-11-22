package com.example.PRD;

import org.springframework.boot.SpringApplication;

public class TestPrdApplication {

	public static void main(String[] args) {
		SpringApplication.from(PrdApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
