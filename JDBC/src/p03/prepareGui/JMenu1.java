package p03.prepareGui;

import java.awt.BorderLayout;
import java.awt.Container;
import java.awt.HeadlessException;
import java.awt.TextField;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

import javax.swing.JCheckBoxMenuItem;
import javax.swing.JFrame;
import javax.swing.JMenu;
import javax.swing.JMenuBar;
import javax.swing.JMenuItem;
import javax.swing.JOptionPane;
import javax.swing.JRadioButtonMenuItem;
import javax.swing.JTextField;

/**[JDBC]
 * 메뉴 만들기
 **/
public class JMenu1 extends JFrame implements ActionListener{
	//필드
	TextField textField;
	//생성자
	public JMenu1() throws HeadlessException{
		Container contentPane = getContentPane();
		contentPane.setLayout(new BorderLayout());
		JMenuBar jmb = new JMenuBar(); //메뉴바 객체 생성
		JMenu menu1 = new JMenu("파일");
		JMenu menu2 = new JMenu("편집");
		//메뉴아이템 생성
		JMenuItem jmi = new JMenuItem("새파일");
		jmi.addActionListener(this); //메뉴아이템에 리스너 붙이기
		menu1.add(jmi); //메뉴에 메뉴아이템 붙이기
		jmb.add(menu1); //메뉴바에 메뉴 붙이기
		
		jmi = new JMenuItem("저장하기"); //메뉴아이템 생성
		jmi.addActionListener(this); //메뉴아이템에 리스너 붙이기
		menu1.add(jmi); //메뉴에 메뉴아이템 붙이기
		jmb.add(menu1); //메뉴바에 메뉴 붙이기
		
		jmi = new JMenuItem("열기");
		jmi.addActionListener(this);
		menu2.add(jmi);
		
		jmi = new JMenuItem("잘라내기");
		jmi.addActionListener(this);
		menu2.add(jmi);
		
		JCheckBoxMenuItem jcbmi = new JCheckBoxMenuItem("눈금자");
		jcbmi.addActionListener(this);
		menu2.add(jcbmi);
		JRadioButtonMenuItem jrbmb = new JRadioButtonMenuItem("수정");
		jrbmb.addActionListener(this);
		menu2.add(jrbmb);
		jmb.add(menu2); //메뉴바에 추가
		setJMenuBar(jmb); //메뉴프레임에 메뉴바 추가
		textField = new TextField();
		contentPane.add(textField,BorderLayout.SOUTH);
		setTitle("JMenuTest");
		setSize(300, 200);
		setVisible(true);
	}
	
	
	//이벤트메소드
	//발생한 이벤트 객체를 String타입으로 반환하는 메소드: getActionCommand();
	@Override
	public void actionPerformed(ActionEvent e) {
		textField.setText(e.getActionCommand());
		JOptionPane.showInternalMessageDialog(textField,textField.getText());
	}

}
