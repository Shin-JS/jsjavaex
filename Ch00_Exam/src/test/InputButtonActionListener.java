package test;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.util.ArrayList;
import java.util.List;

import javax.swing.JTextField;
public class InputButtonActionListener implements ActionListener{
	//처리대상 컴포넌트를 필드로 선언
	JTextField text1;
	JTextField text2;
	JTextField text3;
	List<Member> list = new ArrayList<>();
	//생성자
	public InputButtonActionListener(JTextField text1, JTextField text2, JTextField text3) {
		this.text1 = text1;
		this.text2 = text2;
		this.text3 = text3;
	}
	//메소드
	@Override
	public void actionPerformed(ActionEvent e) {
		//10개의 주소록 저장 파일에 저장(member.txt); 
		File f = new File("c:/temp/member.dat");
		FileOutputStream fos=null;
		ObjectOutputStream oos=null;
		try {
			oos = new ObjectOutputStream(new FileOutputStream(f));
			String name = text1.getText();
			String address = text2.getText();
			String tel = text3.getText();
			Member member = new Member(name,address,tel);
			list.add(member);
			for(int i=0;i<list.size();i++)
				oos.writeObject(list.get(i));//객체 저장
			System.out.println("객체 저장 성공");
			oos.flush();//밀어내기
			oos.close();  
		} catch (Exception ex) {
		System.out.println(ex.getMessage());
		}
	}
}