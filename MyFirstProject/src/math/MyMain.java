package math;

import java.util.Random; //Random class를 사용하기위해 해당패키지를 import

public class MyMain {
	public static void main(String[] args) {
		System.out.println(Math.round(3.14));
		System.out.println(Math.ceil(3.14));
		System.out.println(Math.floor(3.14));
		System.out.println(Math.pow(3, 3));
		System.out.println(Math.abs(-3.14));
		System.out.println(Math.max(-3, 3));
		System.out.println(Math.min(-3, 3));
		
		System.out.println(Math.random());
		
		//Random
		Random random = new Random();  //자동으로 import시켜주는 단축키 Ctrl+Shift+O
		System.out.println(random.nextInt(100) + 1);
		
		
	}
}
