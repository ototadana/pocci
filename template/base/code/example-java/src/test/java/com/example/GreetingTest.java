package com.example;

import org.junit.Test;

import com.example.Greeting;

import static org.junit.Assert.*;

public class GreetingTest {

    @Test
    public void testHello() {
        // when
        String message = new Greeting().hello("Shoichi");

        // then
        assertEquals("hello, Shoichi", message);
    }
}