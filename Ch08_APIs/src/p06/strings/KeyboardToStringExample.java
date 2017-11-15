package p06.strings;

import java.io.IOException;

/**[API]
 * 
 **/
public class KeyboardToStringExample {
	public static void main(String[] args) {
		byte[] bytes = new byte[100];
		System.out.print("입력: ");
		try {
			//read(배열): 값을 읽어서 배열에 저장 후 읽은 값의 길이를 readByteNo에 대입
			int readByteNo = System.in.read(bytes);
			//readByteNo-2를 하는 이유: 키보드에 값을 입력 후 enter키 치면 CR,LF키가 입력됨, 그런고로 그 2키값을 빼고 받기 위해 (실제 입력값만 받음)
			String str = new String(bytes,0,readByteNo-2);
			System.out.println(str);
		} catch (IOException e) {
			System.out.println(e.getMessage());
		}
	}
}
