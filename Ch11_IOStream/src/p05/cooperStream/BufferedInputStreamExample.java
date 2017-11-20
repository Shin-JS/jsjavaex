package p05.cooperStream;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;

/**[보조스트림]
 * -.버퍼보조스트림: 속도향상
 **/
public class BufferedInputStreamExample {
	public static void main(String[] args) {
		long start = 0;
		long end = 0;
		File f = new File("c:/download/forest.jpg");
		FileInputStream fis1;
		FileInputStream fis2;
		try {
			fis1 = new FileInputStream(f);
			start = System.currentTimeMillis(); //시작시각
			while(fis1.read()!=-1) {}
			end = System.currentTimeMillis(); //종료시각
			System.out.println("BufferedStream 미 사용시: "+(end-start)+"ms");
			fis1.close(); //스트림 해제
			System.out.println("=============================================");
			
			fis2 = new FileInputStream(f);
			BufferedInputStream bis = new BufferedInputStream(fis2);//보조스트림
			start = System.currentTimeMillis(); //시작시각
			while(bis.read()!=-1) {}
			end = System.currentTimeMillis(); //종료시각
			System.out.println("BufferedStream 사용시: "+(end-start)+"ms");
			bis.close(); //스트림 해제
			fis2.close();//자원 해제
			
		} catch (FileNotFoundException e) {
			System.out.println(e.getMessage());
		} catch (IOException e) {
			System.out.println(e.getMessage());
		}
	}
}
