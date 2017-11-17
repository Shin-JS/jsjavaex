package p02.readerWriter;

import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.Reader;
import java.io.Writer;
import java.util.Scanner;

public class ReaderWriterExample {
	public static void main(String[] args) throws Exception {
		File f = new File("c:/temp/test1.txt");
		Writer writer = new FileWriter(f);
		Scanner scanner = new Scanner(System.in);
		System.out.print("입력: ");
		String str = scanner.nextLine();
		writer.write(str);
		writer.flush();
		writer.close();
		Reader reader = new FileReader(f);
		int readChar;
		while(true) {
			readChar = reader.read();
			if(readChar==-1) {
				break;
			}else {
				System.out.print((char)readChar);
			}
		}
		reader.close();
		
	}
}
/*배열사용 읽기
 * char[] cbuf = new char[100]; //적당한 크기의 char타입 배열 생성
 * String message = "";
 * while(true){
 * 	readCharNo = reader.read(cbuf); //읽은 데이터 저장 후 길이 저장
 *  if(readCharNo==-1)break;
 *  message+=new String(cbuf,0,readCharNo);
 *  }
 *  System.out.println(message)// 문자열 출력
 * 
 * */
 