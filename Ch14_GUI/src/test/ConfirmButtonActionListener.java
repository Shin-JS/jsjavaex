package test;

import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.OutputStream;
import java.io.Writer;

import javax.swing.JTextField;

public class ConfirmButtonActionListener implements ActionListener{
	//처리대상 컴포넌트를 필드로 선언
	JTextField text1;
	JTextField text2;
	JTextField text3;
	//생성자
	public ConfirmButtonActionListener(JTextField text1, JTextField text2, JTextField text3) {
		this.text1 = text1;
		this.text2 = text2;
		this.text3 = text3;
	}
	//메소드
	@Override
	public void actionPerformed(ActionEvent e) {
		//10개의 주소록을 파일에 저장(member.txt)
		File f = new File("c:/temp/member.txt");
		
		try {
			if(f.exists()==false) {
				f.createNewFile(); //파일이 없으면 만듬
			}
			OutputStream os = new FileOutputStream(f,true); //기존에 있는 파일에 이어쓰기위해 뒤에 true붙여줌
			String info = text1.getText()+","+text2.getText()+","+text3.getText()+"\r\n";
			byte[] output = info.getBytes();
			os.write(output);
			os.flush();
			os.close();
		} catch (Exception e1) {
			System.out.println(e1.getMessage());
		}
		
		String name = text1.getText();
		String address = text2.getText();
		String cp = text3.getText();
		System.out.println("이름: "+name +", 주소: "+ address+", 전화번호: "+cp);
		
	}

}
