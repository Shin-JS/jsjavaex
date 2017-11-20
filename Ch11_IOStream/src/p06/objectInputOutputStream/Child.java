package p06.objectInputOutputStream;

import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.Serializable;

/**[객체입출력]
 * 상속
 * -.일반클래스를 상속받은 후, Serializable인터페이스를 구현한 클래스 & 필드 추가 
 **/
public class Child extends Parent implements Serializable {
//	public String field1; //안보이지만 있는거임... 상속받았으니까...
	public String field2; //직렬화 가능
	
	/**
	 * writeObject()메소드는 객체 저장 직전에 자동(auto)호출되는 메소드: 이 메소드를 재정의하여 부모필드값을 저장
	 **/	
	//부모클래스 객체를 객체입출력하기위해 재정의
	private void writeObject(ObjectOutputStream out) throws IOException{
		out.writeUTF(field1); //String타입의 부모클래스의 field1의 값 저장
		out.defaultWriteObject(); //자식의 필드값(자기자신의 피드값)저장
	}
	/**
	 * readObject()메소드는 객체 생성 직전에 자동호출되는 메소드: 이 메소드를 재정의하여 부모필드값을 대입
	 **/
	private void readObject(ObjectInputStream in) throws IOException, ClassNotFoundException{
		field1 = in.readUTF(); //저장된 String타입의 부모필드 field1의 값 읽어들여서 대입
		in.defaultReadObject(); //자식필드값 읽어들여서 대입
	}

}
