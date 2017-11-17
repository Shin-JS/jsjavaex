package p01.inputOutputStream;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;

/**
 * InputStream: byte단위 입력 스트림
 **/
public class ReadExample3 {
	public static void main(String[] args) {
		try {
			InputStream is = new FileInputStream("c:/temp/test.txt");
			int readbyteNo;
			byte[] readBytes = new byte[8]; //길이가 8인 byte배열
			readbyteNo = is.read(readBytes, 2, 3); //읽어들인 배열의 일부(2번인덱스부터 3개)
			for(int i = 0; i < readBytes.length;i++) {
				System.out.println(readBytes[i]);
			}
			
		} catch (Exception e) {
			System.out.println(e.getMessage());
		};
	}
}
