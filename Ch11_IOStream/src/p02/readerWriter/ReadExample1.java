package p02.readerWriter;

import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.Reader;

/**
 * 문자단위의 입출력 스트림: Reader/Writer
 **/
public class ReadExample1 {
	public static void main(String[] args) throws Exception {
		Reader reader = new FileReader("c:/temp/test.txt");
		int readData;
		while(true) {
			readData = reader.read(); //char→int에 저장
			if(readData==-1) {
				break;
			}else {
				System.out.println((char)readData); //int → char로 변환출력
			}
		}
		reader.close();
	}
}
