package p01.inputOutputStream;
/**
 * OutputStream: byte단위 출력스트림, write()메소드 
 **/

import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.OutputStream;

public class WriteExample {
	public static void main(String[] args) {
		try {
			OutputStream os = new FileOutputStream("c:/temp/test.txt");
			byte[] data = "ABC".getBytes(); //[A][B][C]
			for(int i =0; i<data.length;i++) {
				os.write(data[i]); //1byte를 파일에 기록하는 메소드
			}
			os.flush(); //스트림내의 자료를 밀어내는 메소드
			os.close(); //스트림해제 메소드
		} catch (Exception e) {
			System.out.println(e.getMessage());
		}
		
	}
}
