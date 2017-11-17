package p02.readerWriter;

import java.io.File;
import java.io.FileWriter;
import java.io.Writer;

/**
 * 문자단위의 입출력
 **/
public class WriterExample1 {
	public static void main(String[] args) throws Exception{
		File f = new File("c:/temp/test.txt");
		Writer writer = new FileWriter(f);
		char[] data = "홍길동".toCharArray(); //String → char[홍][길][동]
		for (int i = 0; i <data.length; i++) {
			writer.write(data[i]); //char데이터 하나를 파일에 기록하는 메소드
		}
		writer.write(data); //배열 전체를 파일에 기록하는 메소드 writer(배열)
		writer.write(data,1,2); //배열의 일부를 파일에 기록 writer(배열, 시작인덱스, 길이)
		writer.flush(); //스트림(메모리)에 남아있는 데이터 밀어내기
		writer.close(); //자원해제
	}
}
