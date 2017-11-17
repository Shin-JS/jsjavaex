package p02.readerWriter;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.Reader;

/**
 * 문자단위의 입출력
 **/
public class ReaderExample3 {
	public static void main(String[] args) throws Exception {
		File f = new File("c:/temp/test.txt");
		Reader reader = new FileReader(f);
		int readCharNo;
		char[] cbuf = new char[4]; //전체배열
		readCharNo = reader.read(cbuf, 1, 2); //index 1부터 2개의 char데이터 출력
		for(int i = 0; i < cbuf.length;i++) {
			System.out.println(cbuf[i]);
		}
		reader.close();
		
	}
}
