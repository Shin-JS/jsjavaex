package practice;

import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.Reader;
import java.io.Writer;
import java.util.Scanner;

public class Practice1 {
	public static void main(String[] args) throws Exception {
		File file1 = new File("c:/temp/practice1.txt");
		if(file1.exists()==false) {
			file1.createNewFile();
		}
		Writer writer = new FileWriter("c:/temp/practice1.txt");
		System.out.println("입력");
		Scanner scanner = new Scanner(System.in);
		String str = scanner.next();
		char[] strToChar = str.toCharArray();
		for(int i = 0; i < strToChar.length; i++) {
			writer.write(strToChar[i]);
		}
		writer.flush();
		writer.close();
		int charNo;
		Reader reader = new FileReader("c:/temp/practice1.txt");
		while(true) {
			charNo = reader.read(strToChar);
			if(charNo==-1) {
				break;
			}else {
				str = new String(strToChar,0,charNo);
			}
		}
		System.out.println(str);
		reader.close();
		
	}
}
