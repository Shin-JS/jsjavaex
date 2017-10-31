package io;

import java.io.FileInputStream;
import java.io.FileOutputStream;

public class MyAppByteIO {
	public static void main(String[] args) throws Exception {
		FileInputStream fis = new FileInputStream("bin/io/jeju.txt");  //그냥 파일이름만 적으면 프로젝트폴더(루트)에서 걍 찾음
		FileOutputStream fos = new FileOutputStream("bin/io/jeju2.txt"); 
		
		int b = 0;
		
		while((b = fis.read()) != -1) {
			fos.write(b);
		}
		
		System.out.println(b);
		
		
		fis.close(); //파일을 열었으면 닫아주어야 함
		fos.close();
	}
}
