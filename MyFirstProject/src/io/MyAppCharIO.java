package io;

import java.io.FileReader;
import java.io.FileWriter;

public class MyAppCharIO {
	public static void main(String[] args) throws Exception {
		FileReader fr = new FileReader("bin/io/jeju.txt");	
		FileWriter fw = new FileWriter("bin/io/jeju3.txt");
		
		int c = 0;
		
		while ((c = fr.read()) != -1) {
			fw.write(c);
		}//파일 끝에 다다르면 -1을 리턴하기때문에 조건에 -1에 not(!=)을 걸어준다
		
		
		
		System.out.println((char)c);
		
		
		
		fr.close();
		fw.close();
	}
}
