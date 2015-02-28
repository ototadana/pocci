package com.example;

public class Greeting {

    public String hello(String name) {
        if(name == null) {
            return "bye";
        } else {
        	return "hello, " + name;
        }
    }
}
