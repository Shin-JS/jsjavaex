package p01.inputOutputStream;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;

/**
 * 배열이 있는 형태의 read메소드 
 **/
public class ReadExample2 {
	public static void main(String[] args) {
		try {
			InputStream is = new FileInputStream("c:/temp/test.txt");
			int readByte; //임시저장용 변수(읽어서 배열(readBytes)에 저장한 갯수를 받는 변수)
			byte[] readBytes = new byte[3]; //길이가 3인 byte배열
			String data = "";
			while(true) {
				readByte = is.read(readBytes/*읽은값을 저장하는 배열*/);
				if(readByte == -1) {
					break;
				}else {
					data+= new String(readBytes,0,readByte);
				}
				
			}System.out.println(data);
			is.close(); //자원(stream)해제
			
		} catch (Exception e) {
			System.out.println(e.getMessage());
		}
	}
}
