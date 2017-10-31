package exception;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;

public class MyAppException {
	public static void main(String[] args) throws Exception {
		
		FileInputStream fis = null;
		
		try {
				fis = new FileInputStream("bin/io/jeu.txt");
				
				System.out.println("파일을 찾았습니다.");
			} catch (FileNotFoundException e) { //catch블럭은 여러번 사용가능
				System.out.println("파일을 못찾았습니다.");
			} catch(Exception e) { //이와같은방법으로...
				System.out.println("어떤 exception이 발생했습니다.");
			} finally { //무조건 실행
				System.out.println("exception이 발생하든 안하든");
			}
		
		someMethod();
		fis.close();
	}
	
	public static void someMethod() throws Exception {
		int i = 3;
		if (i != 3) {
			throw new Exception(); //새로운 exception생성
		}
		
	}
}


//try, catch........., exception..............
