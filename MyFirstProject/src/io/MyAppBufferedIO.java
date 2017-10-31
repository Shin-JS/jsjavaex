package io;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.FileInputStream;
import java.io.FileOutputStream;

public class MyAppBufferedIO {
	public static void main(String[] args) throws Exception {
		FileInputStream fis = new FileInputStream("bin/io/jeju.txt");
		BufferedInputStream bis = new BufferedInputStream(fis);
		
		FileOutputStream fos = new FileOutputStream("bin/io/jeju4.txt");
		BufferedOutputStream bos = new BufferedOutputStream(fos);
		
		
		byte[] buffer = new byte[10];
		int num = 0;

		while ((num = bis.read(buffer)) != -1) {
			bos.write(buffer, 0, num);
		}
						
		
		fis.close();
		bis.close();
		bos.close();
		fos.close();
	}
}
