package p06.objectInputOutputStream;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;

/** [객체입출력]
 * 상속
 **/
public class NonSerializableParentExample {
	public static void main(String[] args) throws Exception {
		FileOutputStream fos = new FileOutputStream("c:/temp/Object4.dat");
		ObjectOutputStream oos = new ObjectOutputStream(fos);
		FileInputStream fis = new FileInputStream("c:/temp/Object4.dat");
		//파일로부터 객체를 읽어들일 스트림 생성
		ObjectInputStream ois = new ObjectInputStream(fis);
		//파일에 저장할 자식객체 생성
		Child child = new Child();
		child.field1 = "홍길동"; //부모클래스에서 상속받은 필드
		child.field2 = "일지매"; //자식클래스에서 추가된 필드
		oos.writeObject(child); //파일에 객체 저장
		oos.flush();
		oos.close();
		fos.close();
		Child v = (Child) ois.readObject(); //
		System.out.println("field1:"+v.field1);
		System.out.println("field2:"+v.field2);
		ois.close();
		fis.close();//자원해제
		
		
	}
}
