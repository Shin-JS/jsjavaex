package io;

import java.util.Scanner;

public class MyAppConsoleInput {
	public static void main(String[] args) {
		Scanner scanner = new Scanner(System.in);
		
		System.out.print("텍스트를 입력하세요:" );
		
		String str = scanner.next();
		
		System.out.println("입력받은 값은:" + str);
		
		scanner.close();
	}
}
