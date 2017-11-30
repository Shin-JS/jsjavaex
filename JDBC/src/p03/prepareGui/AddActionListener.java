package p03.prepareGui;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;

import javax.swing.JOptionPane;
import javax.swing.JTextField;

public class AddActionListener implements ActionListener{
	JTextField text1;
	JTextField text2;
	JTextField text3;
	String sql = "insert into address(name,address,tel) values(?,?,?)";
	public AddActionListener(JTextField text1, JTextField text2, JTextField text3) {
		this.text1 = text1;
		this.text2 = text2;
		this.text3 = text3;
	}
	@Override
	public void actionPerformed(ActionEvent e) {
		Connection conn = null;
		PreparedStatement pstmt = null;
		try {
			conn = Connections.getInstance().getConnection();
			pstmt = conn.prepareStatement(sql);
			pstmt.setString(1, text1.getText());
			pstmt.setString(2, text2.getText());
			pstmt.setString(3, text3.getText());
			int result = pstmt.executeUpdate();
			if(result>0) {
				JOptionPane.showMessageDialog(null, "저장완료");
			}else {
				JOptionPane.showMessageDialog(null, "저장실패");;
			}
			pstmt.close();
			conn.close();
		} catch (Exception e2) {
			System.out.println(e2.getMessage());
		}
	}
}
