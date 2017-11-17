package p02.readerWriter;

import java.io.FileWriter;
import java.io.Writer;

/**
 * 문자단위의 입출력
 **/
public class WriterExample2 {
	public static void main(String[] args) throws Exception {
		Writer writer = new FileWriter("c:/temp/test.txt");
		String data = "안녕 자바 프로그램";
		writer.write(data,3,2);
		writer.flush();
		writer.close();
	}
}
