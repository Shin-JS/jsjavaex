package p02.readerWriter;

import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.Reader;

/**
 * 문자단위의 입출력
 **/
public class ReadExample2 {
	public static void main(String[] args) throws Exception {
		Reader reader = new FileReader("c:/temp/test.txt");
		int readCharNo;
		char[] cbuf = new char[2];
		String data = "";
		while(true) { //무한반복
			
			readCharNo = reader.read(cbuf); //읽은 문자의 갯수만큼 리턴
			if(readCharNo==-1) { //읽어들일 내용이 없으면 -1리턴
				break; //-1이면 while문 종료
			}else {
			data += new String(cbuf,0,readCharNo); //String(배열,0,읽은길이)
			}
		}
		System.out.println(data); //만들어진 문자열 출력
		reader.close();
	}
}
